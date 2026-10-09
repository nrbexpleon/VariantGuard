const uniq = xs => [...new Set((xs||[]).filter(Boolean))];
const overlap = (a,b) => a.some(x => b.includes(x));
const safetyWeight = x => ({'QM':0,'ASIL-A':1,'ASIL-B':2,'ASIL-C':3,'ASIL-D':4}[x] ?? 0);
const changeWeight = x => ({PATCH:1,MINOR:2,CONFIGURATION:3,MAJOR:4,PLATFORM:5}[x] ?? 2);
const level = n => n >= 10 ? 'CRITICAL' : n >= 7 ? 'HIGH' : n >= 4 ? 'MEDIUM' : 'LOW';

export function validateProgram(x) {
  const errors=[];
  if(!x?.name?.trim()) errors.push('Programme name is required.');
  if(!x?.owner?.trim()) errors.push('Programme owner is required.');
  if(!x?.release?.trim()) errors.push('Target release is required.');
  return errors;
}
export function validateVariant(x) {
  const errors=[];
  for(const k of ['name','platform','hardware','os','middleware']) if(!x?.[k]?.trim()) errors.push(`${k} is required.`);
  return errors;
}
export function validateComponent(x) {
  const errors=[];
  for(const k of ['name','version','owner']) if(!x?.[k]?.trim()) errors.push(`${k} is required.`);
  return errors;
}

export function compatibility(component, variant) {
  const c=component.constraints||{}, reasons=[];
  if(c.platforms?.length && !c.platforms.includes(variant.platform)) reasons.push(`platform ${variant.platform} is unsupported`);
  if(c.hardware?.length && !c.hardware.includes(variant.hardware)) reasons.push(`hardware ${variant.hardware} is unsupported`);
  if(c.os?.length && !c.os.includes(variant.os)) reasons.push(`OS ${variant.os} is unsupported`);
  if(c.middleware?.length && !c.middleware.includes(variant.middleware)) reasons.push(`middleware ${variant.middleware} is unsupported`);
  if(c.requiredFeatures?.length && !c.requiredFeatures.every(x=>(variant.features||[]).includes(x))) reasons.push('required vehicle features are missing');
  if(c.excludedFeatures?.length && overlap(c.excludedFeatures,variant.features||[])) reasons.push('an excluded vehicle feature is present');
  return {compatible:!reasons.length,reasons};
}

export function analyze(program, input) {
  const component=program.components.find(x=>x.id===input.componentId);
  if(!component) throw new Error('Component was not found.');
  const changedTags=uniq([component.id,component.name,...(component.tags||[]),...(input.changedTags||[])]);
  let affected=program.variants.filter(v=>(v.components||[]).includes(component.id));
  if(input.includeCompatibleCandidates) affected=program.variants.filter(v=>(v.components||[]).includes(component.id)||compatibility(component,v).compatible);
  const variants=affected.map(v=>{
    const comp=compatibility(component,v), applicableTests=program.tests.filter(t=>{
      const tags=uniq(t.tags||[]); const direct=overlap(tags,changedTags)||overlap(tags,v.features||[])||(t.componentIds||[]).includes(component.id);
      const platform=!t.platforms?.length||t.platforms.includes(v.platform); return direct&&platform;
    });
    const requiredKinds=uniq(['REGRESSION',...(input.cybersecurityRelevant?['CYBERSECURITY']:[]),...(safetyWeight(v.safetyLevel)>=2?['SAFETY']:[])]);
    const coveredKinds=uniq(applicableTests.map(t=>t.kind));
    const missingKinds=requiredKinds.filter(x=>!coveredKinds.includes(x));
    let score=changeWeight(input.changeType)+safetyWeight(v.safetyLevel)+(comp.compatible?0:4)+missingKinds.length*2+(input.cybersecurityRelevant?1:0);
    return {variantId:v.id,name:v.name,platform:v.platform,safetyLevel:v.safetyLevel,compatible:comp.compatible,incompatibilities:comp.reasons,selectedTests:applicableTests.map(t=>({id:t.id,name:t.name,kind:t.kind,level:t.level||'COMPONENT'})),missingTestKinds:missingKinds,riskScore:score,riskLevel:level(score)};
  });
  const findings=[];
  const incompatible=variants.filter(v=>!v.compatible), uncovered=variants.filter(v=>v.missingTestKinds.length), critical=variants.filter(v=>['CRITICAL','HIGH'].includes(v.riskLevel));
  if(!affected.length) findings.push({severity:'high',title:'No affected variants identified',action:'Verify component allocation and change scope.'});
  if(incompatible.length) findings.push({severity:'critical',title:`${incompatible.length} affected variants are incompatible`,action:'Resolve constraints or explicitly exclude the variants from release.'});
  if(uncovered.length) findings.push({severity:'high',title:`${uncovered.length} variants have test coverage gaps`,action:'Add tests for each missing required test kind.'});
  if(!program.tests.length) findings.push({severity:'high',title:'Test catalogue is empty',action:'Import or define the programme regression catalogue.'});
  const allTests=uniq(variants.flatMap(v=>v.selectedTests.map(t=>t.id)));
  const decision=incompatible.length||uncovered.length||!affected.length?'HOLD':critical.length?'EXPERT_REVIEW_REQUIRED':'CANDIDATE_FOR_RELEASE';
  return {id:input.id,createdAt:input.createdAt,component:{id:component.id,name:component.name,version:component.version},change:{title:input.title,changeType:input.changeType,changedTags,cybersecurityRelevant:Boolean(input.cybersecurityRelevant)},summary:{totalVariants:program.variants.length,affectedVariants:variants.length,incompatibleVariants:incompatible.length,coverageGaps:uncovered.length,highCriticalVariants:critical.length,selectedTests:allTests.length},decision,variants,findings,disclaimer:'Engineering decision support only. Human review and programme-approved evidence are required.'};
}
